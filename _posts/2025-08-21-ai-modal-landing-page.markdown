---
layout: post
title:  "Finding the mode with claude code"
subtitle: ""
date: 2025-08-20 08:20:40
categories: blog
---

<style>
code {
  white-space: pre-wrap;
}
</style>

I'm preparing to release an open-source package -- the details don't matter very much, but it's a UX to fine-tune OCR models. As I'm prepping for release, I decided I should have a landing page. I am definitely on the AI coding assistant train (handing over my $20/month to anthropic, for claude code), and as such I make a vague request for it to give me something that _isn't_ just the default scaffolded next.js landing page.

Here is what I asked:

```
> update src/app/page.tsx to be more descriptive and not use the default next.js styles
```

I did this with some curiosity, as it's obviously a generic prompt. What does "be more descriptive" mean? What styles would it pick by default? Well, here's what it did:

<div style="width: 100%;">
  <img style="width: 100%;" src="/static/images/saas_landing_page.png" />
</div>

Dear god, it's a SaaS marketing page. Trust me, if you scroll down, it's nearly pitch-perfect.

When I put in this prompt, I had limited-to-no expectations about what would come out. I just figured prompting would be an easy way to get something different, a starting point that I could work from. The only point I wanted to make with this post, really, is that I guess the internet's modal landing page is a SaaS marketing page. Or, more likely, the modal user of Claude Code is making a SaaS, Anthropic knows this, and has tuned their model, updated their training data, etc. appropriately. It was pretty interesting to see regardless.

Of course, I then updated my prompt to get what I actually wanted. However, _I hadn't known what I had wanted_ prior to seeing this SaaS page. This gave me a bit of a creative jump start, similar to how you might [go scroll dribbble](https://dribbble.com/tags/landing-page) for some ideas. And that was helpful.

