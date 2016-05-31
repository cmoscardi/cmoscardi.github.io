---
layout: post
title:  "Embedding D3 in IPython Notebook"
date:   2015-08-12 17:20:40
categories: blog
---

[Jupyter](https://jupyter.org/) is a fantastic tool that we use at [The Data Incubator](http://www.thedataincubator.com/) for instructional purposes. 
In particular, we like to keep our curriculum compartmentalized via Jupyter notebooks. It allows us to test our code samples across any language there's a Jupyter kernel for\* and keep things in one place, so our fellows don't have to rifle through a wide variety of file formats before getting to the information they need.

One area where we only recently integrated Jupyter was frontend web visualization. Our previous structure involved a notebook, possibly with code snippets, that contained links to various HTML files. We expected our fellows to dig through the code to 

- Look at the HTML source for the basic layout.
- Expose the Javascript powering the visualization.
- View the styles making everything pretty.

Oh, and any data processing code was separate/output to a file. Obviously not ideal. We knew IPython had a `%%javascript` magic, and started rifling around to see what we could improve. 



Including `d3.js`
===
Conveniently, Jupyter already uses `require.js`, and it works great! Thanks to [this blogpost](http://www.machinalis.com/blog/embedding-interactive-charts-on-an-ipython-nb/) (explaining a slightly more cumbersome way to embed D3) for the tipoff.

{% highlight javascript %}
%%javascript
require.config({
  paths: {
      d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min'
  }
});
{% endhighlight %}

The Big Discovery: `element`
===
IPython's `%%javascript` magic runs code client-side and sets a global JQuery-selected variable, `element`, to refer to the output cell. This is obviously very convenient - we now have a way to create arbitrary DOM elements in our cell. In particular, we can create SVG canvases and add SVG shapes to that canvas... see where this is going?

This means we can write code like this:

{% highlight javascript %}
%%javascript
element.append("<div id='chart1'></div>");
{% endhighlight %}

and we've created a nice div in our output!

Data Conversion: Pandas Dataframe -> JSON
===
This one's a bit of a hack. Basically, since the `%javascript` magic is run client-side, `window` is set. So we do what every JS developer has (maybe shamefully) done at some point in their career, and bind data to `window` so that it's globally accessible.

But wait, it gets better: Pandas dataframe objects have a `to_json` function! The only trick now is managing to execute some JS code that loads the JSON dump we can get for free from Pandas. Here's a snippet that does just that, invoking some of IPython's backend display logic:

{% highlight python %}
from IPython.display import Javascript
#runs arbitrary javascript, client-side
Javascript("""
           window.vizObj={};
           """.format(df.to_json()))
{% endhighlight %}

As it turns out, Pandas dumps its dataframes in a way that isn't exactly what D3 is [looking for](https://github.com/mbostock/d3/wiki/Selections#data) by default. You may want to restructure your data in a certain way for D3 - you now have the freedom to do that in JS or Python - as long as you can call `json.dumps` on it in Python, you can bind it to D3. You could also call pandas' `to_csv`, bind that string to the client side, and load it into D3 using the `d3.csv` convenience function.

Final Result 
=====
With all this taken care of, there isn't really much else to do! We now have interactive visualizations! After this, it's up to you to write whatever you want in D3. This sort of embedding might be useful if you want to pass around analysis and visualization source code all-in-one, so that a collaborator can immediately reproduce a given result and help tweak your visualizations. If you're giving a talk, it's very useful for instructive purposes!

Here's a sample, very basic, D3 visualization. You can see the ipython notebook [here](https://github.com/cmoscardi/embedded_d3_example/blob/master/Embedded_D3.ipynb). 

Unfortunately, github doesn't render JS (how cool would that be...), so you can clone the repo to play with it yourself. But that notebook gives the gist of it.


Other useful tools
===
[mpld3](http://mpld3.github.io/) - cross-compiling matplotlib into D3.js code, plays nice with ipython notebooks.


\*if you're interested in Jupyter notebook testing, let me know - seems like good fodder for another post!
