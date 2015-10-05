---
layout: post
title:  "Integrating Chef and Google App Engine"
date:   2015-10-04 17:20:40
categories: blog
---

Anyone who's ever tried to write a nontrivial application on Google Appengine has encountered at least seven\* design decisions that have led to serious head-scratching moments. One of those happened to me about a month ago, while integrating [Chef](https://www.chef.io/chef/) into our course at [The Data Incubator](www.thedataincubator.com). Our goal was to allow for one-click spinning up (on [DigitalOcean](http://digitalocean.com)'s cloud) and monitoring of our Fellows' course machines, already under Chef management. 

\* No basis in fact - there are probably more than seven. It should be noted that the Google Cloud Platform is going to greatly improve this situation by allowing you to deploy Docker containers - woohoo!

##A First Look

Chef servers have an [HTTP API](https://docs.chef.io/api_chef_server.html). Seems like it'd be an easy integration, right? While GAE doesn't let you do many things (including making SMTP connections), one thing you, thankfully, *can* do with relative ease is make HTTP requests (although everyone's favorite python HTTP library, [requests](http://www.python-requests.org/en/latest/), is a [total](http://stackoverflow.com/questions/21605328/python-requests-on-google-app-engine-not-working-for-https) [nightmare](http://stackoverflow.com/questions/9762685/using-the-requests-python-library-in-google-app-engine) - but that's for another blogpost). This was going to be a quick job - we'd spend a couple days coding, write some tests, and have one-click deployment, right? *right?*. As you probably guessed, that timeline was anything but right.


## Problem #1 : PyCrypto and PyCrypto only.
Not only does Chef have an HTTP API, but there's a [pretty good library](https://github.com/coderanger/pychef) that wraps it in user-friendly python. Unfortunately, that library uses [libcrypto](https://github.com/coderanger/pychef/blob/master/chef/rsa.py), meaning that it's a no-go for GAE. 

Why, do you ask, is Chef's API requiring the use of libcrypto? Well, let's examine that Chef server [HTTP API](https://docs.chef.io/api_chef_server.html) doc again. You'll notice you have to send very specific requests, with very specificially encoded headers, to the Chef Server. In particular, you need to use a Chef Client private key to sign the request (using an RSA signature protocol - private key signing) and send that signature in the headers.

To circumvent this without getting unnecessarily deep into RSA implementation specifics, we looked at the [Chef docs](https://docs.chef.io/auth.html) and found some simple commands to sign the headers using [openssl](https://www.openssl.org/docs/manmaster/apps/rsautl.html). We found that PyCrypto's `RSA.decrypt`\* function would appropriately generate our message signature, provided we byte-padded the input string beforehand (in accordance with [a particular set of standards](https://en.wikipedia.org/wiki/PKCS_1). 

\*A brief aside: we didn't just stumble upon `RSA.decrypt` as the function to use... we had a bit of prior knowledge. RSA private key signatures work essentially by having the signer raise a message (or, more accurately, the message's hash) `m` to the `d` power (where `d` is the private key), allowing anyone with the public key `e` to verify that `m^ed == m` (mod n of course). RSA encryption also raises a message `m'` to the `d` power when the recipient wants to read the message using their private key, where `m' == m ^ e`. Anyway, enough math and protocols!

Here's what that byte-padding looks like (props to [this post](http://engineering.hearsaysocial.com/2012/01/25/using-pycrypto-instead-of-m2crypto-on-google-app-engine/) for the snippet, replicated in our own codebase):

{% highlight python %}
def _emsa_pkcs1_v1_5_encode(m, em_len):
  """
  em_len: # of bytes in the key
  m : message
  """
  ps = '\xff' * (em_len - len(m) - 3)
  return '\x00\x01' + ps + '\x00' + m
{% endhighlight %}

With this out of the way, we thought we were in the clear, until...

##Problem #2: `dev_appserver.py` doesn't respect ignoring SSL verification.
Our Chef server lives on a DigitalOcean box, and the SSL certificate is self-signed (we dont need client-facing trustworthiness on this one). No problem: we'd just pass `verify=False` as a flag into our HTTP request code. Unfortunately, [this](http://stackoverflow.com/questions/28866770/appengine-urlfetch-validate-certificate-false-none-not-being-respected) recently became a problem in the GAE development environment. 

We still haven't found a great solution to this, so we just ensure that locally, we have our self-signed certificate added into OpenSSL a la the following [post](http://unix.stackexchange.com/questions/90450/adding-a-self-signed-certificate-to-the-trusted-list). If you have a better solution, please let me know!


## Solution: An Open Source Library!
We open-sourced the library. It uses version `2.1.0` of `requests` (the last version that [can be used](http://stackoverflow.com/questions/21605328/python-requests-on-google-app-engine-not-working-for-https) on GAE), and the latest PyCrypto (2.6.1 as of this writing). It works swimmingly, though only on the actual GAE environment if you don't trust your Chef Server's SSL certificate.
