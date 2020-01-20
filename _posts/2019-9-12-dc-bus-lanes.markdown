---
layout: post
title:  "How well do red-painted bus lanes work?"
date:   2019-09-12 17:20:40
categories: blog
---

[Starting June 3](https://ddot.dc.gov/page/h-i-streets-nw-bus-lane-pilot) and ending September 27, DDOT piloted two bus lanes on H and I streets. In particular, the District painted the rightmost lanes of these streets red, and dedicated those lanes to buses between 7AM to 9:30AM and 4PM to 6:30PM. But, did those shiny, fresh coats of paint actually do anything? According to DDOT, "Preliminary data comparing June 2018 and June 2019 found improvements in bus speeds and reliability on I Street NW _but not on H Street NW_." Let's dig into that a little bit, especially keeping in mind that in NYC, the 14th street bus lanes saw [immediate, dramatic improvements](https://ny.curbed.com/2019/10/18/20919729/new-york-transportation-bus-lane-transit-priority) upon closing an entire road to traffic. Do visual demarcations that close a single lane to traffic have the same effect?


### The Data
Unlike DDOT (who have presumably been archiving their bus location data since the beginning of time, and should make their archive public), a friend and I have been archiving every real-time bus ping since 2019. The way this works is that every minute or so, any given bus will ping its latest location to a central server. Our archiving script runs on minute-ly intervals and catches those pings, saving them off into files which you can access [here](https://busdata-00-us-west-2.s3-us-west-2.amazonaws.com/). 


### The methods
In order to compute speeds on these routes, I performed the following procedures on the archived data.

1. 

### TL;DR -- It's not clear that the lanes have measurably improved speeds.

Really, the story is the following graphs. First, let's look at H street. The below plots show average bus speeds on the corridor each day, both before and after the new lanes got painted.

![slow buses](/static/images/h_street_corridor_timeseries.png)

Yikes. Let's break this out a little bit. First, the AM rush hour is categorically faster than the PM rush hour -- the lowest (smoothed) daily average speed on H street is 10.5 MPH. Then, in the PM we see average speeds range from about 5.5MPH slowest... to a max of 10.5 MPH! 

However, what's arguably more interesting here is the trends in both charts. In the first, we see that there is effectively no change in trend before the red dashed line and after it. In other words, the buses appear to be getting progressively faster on the mornings on H street, but it doesn't look like the bus lanes have anything to do with it -- they were already getting faster before the introduction of the bus lanes!And on the other side, during the PM rush hour, we see effectively no change. The precipitous dip in speed after the introduction of the bus lane is concerning, but that does even out by the end of the study period.


We see similar behavior on I street, but reversed.

![more slow buses](/static/images/i_street_corridor_timeseries.png)

Perhaps here, it is the case that during the PM rush hour, we see some marginal improvement -- it may be the case that the trend begins increasing slightly faster. It's hard to see without a basis for comparison. At this point, it would be interesting to perform a difference-in-difference experiment here. Specifically, find an area that's similar to I street during the PM rush hour, but didn't have a bus lane painted in. And then compare the trend of bus speeds in that area. Did those buses get similarly faster during this time, or did something "special" happen on I street once the lane was installed?
