---
layout: post
title:  "Testing Jupyter Notebooks"
date:   2016-01-20 17:20:40
categories: blog
---

[Jupyter](https://jupyter.org/) is a fantastic tool that we use at [The Data Incubator](http://www.thedataincubator.com/) for instructional purposes. One perk of using Jupyter is that we can easily test our code samples across any language there's a Jupyter kernel for. In this post, I'll show you some of the code we use to test notebooks!

First, a quick discussion of the current state of testing ipython notebooks: there isn't much documented about the process. [ipython_nose](https://github.com/taavi/ipython_nose) is a really helpful extension for writing tests into your notebooks, but there's no documentation or information about easy end-to-end testing. In particular, we want the programmatic equivalent of clicking "run all cells".

After poking around things like [github's list of cool ipython notebooks](https://github.com/ipython/ipython/wiki/A-gallery-of-interesting-IPython-Notebooks) and the Jupyter docs, two things became apparent to us:

1. Most people do not test their notebooks.
2. Automated end-to-end testing is extremely easy to implement.

Given 2. , 1. is really surprising. Having automated testing makes any developer's life _so much easier_ - and that includes curriculum devs, instructors, or individuals writing technical talks that present lecture notes in the `.ipynb` format. Hence this post: hopefully this post will help make at least a few people's lives easier!

In terms of testing code execution, here's what our testing process looks like at a high level. It's actually really simple and basically mirrors the requirements we described above.

- Execute notebook.
- Check output cells for errors and raise the first one we find.

(We also test other things in our notebooks - e.g. that all of our links are up-to-date)

## First step: Execute notebook

As it turns out, programmatic execution of Jupyter notebooks is pretty straightforward. You can run the command:

{% highlight bash %}
ipython nbconvert --to notebook --execute --ExecutePreprocessor.timeout=60\ 
                  --output out_file in_file
{% endhighlight%}

And end up with a fully executed notebook. As mention above, we run a few other tests on our notebooks - and those tests are written in python (this partially has to do with the fact that Jupyter used to be IPython Notebook). As such, we also wrote a wrapper function to run this code in python and return the parsed notebook as a python object.

{% highlight python %}
import os
import subprocess
import tempfile

from IPython import nbformat

def _notebook_run(path):
    """Execute a notebook via nbconvert and collect output.
       :returns (parsed nb object, execution errors)
    """
    dirname, __ = os.path.split(path)
    os.chdir(dirname)
    with tempfile.NamedTemporaryFile(suffix=".ipynb") as fout:
        args = ["ipython", "nbconvert", "--to", "notebook", "--execute",
          "--ExecutePreprocessor.timeout=60",
          "--output", fout.name, path]
        subprocess.check_call(args)

        fout.seek(0)
        nb = nbformat.read(fout, nbformat.current_nbformat)

    errors = [output for cell in nb.cells if "outputs" in cell
                     for output in cell["outputs"]\
                     if output.output_type == "error"]

    return nb, errors
{% endhighlight %}

## Next Step: Checking Output Cells
This is the part you can do with any test suite you want. We want to confirm that the notebook in question runs all cells correctly.

In python, using a framework like `py.test`, we can do something as simple as this:
{% highlight python %}
def test_ipynb():
    nb, errors = _notebook_run('my_notebook.ipynb')
    assert errors == []
{% endhighlight %}

And receive back the specific errors that occurred when trying to execute our cells.


## That's it!  Here are some other things you could do to ensure production-quality notebooks:

- (Python only) Use the [ipython_nose](https://github.com/taavi/ipython_nose) extension to write unit tests for your code. If you include them at the bottom of the notebook, they'll be executed as normal cells, and will raise errors if a test fails! This way you can check, for example, interactive functionality as users begin playing with your notebook.
- Lint your code cells using something like [flake8](https://pypi.python.org/pypi/flake8) for your favorite language.
- Check that all links in your notebooks are alive.
