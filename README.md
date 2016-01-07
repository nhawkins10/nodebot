# nodebot
An IRC bot written in javascript using node.

###Functionality

#####Weather
Returns the current temperature and conditions for a given zip code. Currently only works with zip codes. Example command:
```
compassbot weather 65613
```

#####Traffic
Returns the time in minutes that it will take to travel to the given location in current traffic. All travel is calculated from the Innovations Campus. Example commands:
```
compassbot traffic Liberty MO
```

```
compassbot traffic 4712 Broadway St, Kansas City, MO
```


#####Stocks
Returns the company name and current stock price for the given symbol. Example command:
```
compassbot stock cern
```


#####Ascii
Returns the given text formatted as ascii art. Example command:
```
compassbot ascii Hello world!
```


#####Insult
Generates a random Shakespearean insult and insults the given user. Example command:
```
compassbot insult John
```
