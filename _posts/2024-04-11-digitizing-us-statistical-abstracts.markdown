---
layout: post
title:  "Digitizing the statistical abstracts of the united states"
date:   2024-04-11 17:20:40
categories: blog
---

<!-- todo: flesh out -->
## What is this?
The [Statistical Abstracts of the United States](https://www.census.gov/library/publications/time-series/statistical_abstracts.html) is a historical Census Bureau dataset that includes many useful things if you're working on a PhD, like [historical grain exports](gran export link). The Bureau has scanned these documents -- so in that sense, they are already digitized -- but they have not attempted to perform OCR or publish the tables in a native format. 

![image of statistical abstract table with cheeky caption](cheeky image)


## Attempt \#1: Tesseract
I actually first attempted this several years ago, using [tesseract](link-to-tesseract). The results were not great, and still aren't great.

![tesseract results](tesseract results)

Unfortunately, OCR is not _quite_ yet plug-and-play.


## A brief overview of the OCR/document extraction landscape
However, in exploring the OCR landscape, I discovered a variety of libraries and services doing "OCR" and related activities. In addition, Microsfot, Google, and Amazon have offerings in the "OCR cinematic universe."
![The OCR cinematic universe](diagram of the stuff out there)

## Attempt \#2: State-of-the-art, stock
I developed a pipeline from this series of technologies that looks approximately like the below diagram:
![diagram of layout recog -> OCR -> table extraction](cheeky diagram)

It... kinda mostly worked.

![image of results]


## Attempt \#3: fine-tuning
At this point, it was clear to me that even the best out-of-the-box models do not perform well enough for high-quality document digitization, _especially_ for a use case like digitizing official statistics (the Census Bureau really can't publish a wrong number and then go _shrug_, ask the OCR people).

SO, it was time to get my hands dirty. This also gave me the opportunity to do this as a real data project -- set up quality metrics for the different parts of the pipeline I care about, measure those metrics, and hopefully improve upon them.

## HOLY CRAP!



