# twitter-ticker
Headlines move across the screen. Each headline is clickable and will take the user to the relevant article.  When moused over the headlines stop moving. The final version of this collects headlines from 3 different news organization's Twitter feeds. 

## See it live 
<a href="https://maggie-wiseman-portfolio.herokuapp.com/ticker/">here</a>

## How it works
This project had several iterations.  First, hardcoded headlines were animated. Next ajax was used to get headlines from a json file. Finally, interatcting with the Twitter API allowed me to get the latest headlines for the ticker.

### Animation
Given a list of headlines hardcoded into anchor tags into an html, get them to move across the sreen from right to left. First all headlines were positioned with left: 100%.  An animation frame is used to animate the headlines. A variable stores the initial offset of the headline div and then is decremented by two pixels for each repaint done by the browser.  

The tricky part was appending the first headline to the end of the headlines list so that the headlines appeared to continue indefinitely.  This was done by comparing the left position of the headlines div and the length of the first headline.  If the left position was larger than the headline, the first headline must be off the screen.  It could, at this point, be removed from the front of the array and appended to the end. The jQuery append() method is smart enough to know that if the element is part of the div that it should be removed from current position and placed at the end.  Win!

### Ajax
The code was refactored to use jQuery, specifically so I could use an ajax call to get the data via a JSON file and then format it accordingly.

### Twitter API
The code was refactored again to get headlines from the Twitter API. 

A simple Express.js on Node.js server was set up.  The server returned a simple index.html file which makes an ajax call to '/headlines.  This route 
