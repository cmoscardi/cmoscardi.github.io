---
layout: post
title:  "Anaconda Dependency Minification"
date:   2016-05-18 17:20:40
categories: blog
---

At [The Data Incubator](https://www.thedataincubator.com), we really like anaconda. In particular, we like that we can quickly install and update environments that include the usual PyData libraries (numpy, scipy, pandas) at any version from binary code. One issue we've had, however, is that freezing conda environments, currently, is machine-specific. In particular, there are subtle differences in versions of binary dependencies required on different machines for cairo, a dependency of matplotlib.

However, we (and, we suspect, most data scientists) don't really care about that. We just want PyData at the appropriate versions on our machines. We tried to capture this behavior by minifying the environment.yml file and taking only the "most important" packages - the ones that, because they depend on other packages, will install everyting currently specified in `environment.yml`. For the rest of the packages, we just want the latest version, and anaconda automatically behaves this way for us.



Dependencies and graphing them
--
So, maybe you've thought about dependencies before. We have. As it turns out, we can think of dependencies as a directed acyclic graph (often called by their abbreviation, DAG).\* In this graph, each package is a node, and if package X depends on package Y, we have a (directed) edge (X, Y). 

See those nodes at the far left - the ones that represent packages which aren't dependencies for any other packages? We call those "source nodes" (or source packages, for the purposes of this explanation). Those are the nodes we care about, as they represent the packages we really care about. To find this set of packages, we can take the complement (in graph theory parlance, "the cut") of the subset of all nodes which are specified as another package's dependency. This leaves us with our source packages.


\* We could conceivably have two packages which are "tightly coupled" - i.e. depend on each other - but that's typically considered pretty bad practice. We know of no examples of this in anaconda's repositories.

Code
--
Here's how we do this in practice.

- Parse all packages/versions in `environment.yml`

- Get the dependencies of each package and store them in a set (so we know which packages appeared as a dependency at least once).

We do this with `conda info [package_name]`. Here's a sample output:
{% highlight bash %}
[cmoscardi.github.io]$ conda info numpy
Fetching package metadata: ....

numpy 1.5.1 py27_pro0
---------------------
file name   : numpy-1.5.1-py27_pro0.tar.bz2
name        : numpy
version     : 1.5.1
build number: 0
build string: py27_pro0
channel     : defaults
size        : 3.4 MB
build_target: pro
date        : 2012-11-09
features    : mkl
license     : BSD
md5         : 7379c7071ed6c29568a4bb7ca22efc57
installed environments:
dependencies:
    mkl 10.3
    nose
    python 2.7*

numpy 1.5.1 py27_ce0
--------------------
file name   : numpy-1.5.1-py27_ce0.tar.bz2
name        : numpy
version     : 1.5.1
build number: 0
build string: py27_ce0
channel     : defaults
size        : 4.6 MB
build_target: ce
date        : 2012-11-09
license     : BSD
md5         : f53b0807eac1e45910dd2ef5e1da4b97
installed environments:
dependencies:
    nose
    python 2.7*


.....
{% endhighlight %}
As you can see in the source code, we chose to use python to scrape this output.

- Take the complement of all requirements and every package that appears as a dependency, making sure to preserve version for these "important" packages.
It's a simple snippet:

{% highlight python %}
def calc_difference(packages, deps):
  """
  packages: a dict where keys are package names, values are versions (or None).
  deps: the set of all package names which occurred at least once as a dependency.
  """
  source_names = set(packages.keys()) - deps
  return {n: packages[n] for n in source_names}
{% endhighlight %}

--- 

One other thing
===
It's worth noting that our minifier also removes the "binary" package spec at the end of the version string. For example, a numpy binary in the anaconda repo is explicitly located by the following string:
[example string here]
We remove that last bit, and make conda resolve depending on the machine we're on, so it looks like this:
[fixed string here]


Pitfalls
=== 
We've come across some interesting cases. For example, what if we want to include [bokeh](), which depends on numpy, scipy, and pandas? Suddenly, we have to explicitly declare our PyData packages. Since pandas depends on numpy and scipy (VERIFY), even including pandas means we don't specify our numpy or scipy versions. Our suggestion: if you know you need numpy 1.9.2, hard-specify that version after running this minifier.
