# twitter-ticker
Headlines move across the screen. Each headline is clickable and will take the user to the relevant article.  When moused over the headlines stop moving. The final version of this collects headlines from 3 different news organization's twitter feeds. 

## See it live 
<a href="https://maggie-wiseman-portfolio.herokuapp.com/ticker/">here</a>

## How it works
This project had several iterations.  

### Animation
Given a list of headlines hardcoded into anchor tags into an html, get them to move across the sreen from right to left.  
First all headlines were positioned with left: 100%.  An animation frame is used to animate the headlines. TA variable stores the initial offset of the headline div and then is decremented by two pixels for each repaint done by the browser. 

### Ajax
The code was refactored to use jQuery, specifically so I could use ajax an ajax call to get the data via a JSON file and then format it accordingly.

### Twitter API
The cod was refactored again to get headlines from the Twitter API. 
