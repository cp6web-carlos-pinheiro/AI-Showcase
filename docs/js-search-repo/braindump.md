Project: Github Repository Searcher

The user types a search term and presses ENTER.
The application searches the Github API and displays the results found.

Repository information to display:

    Author's name and photo

    Repository name

    Repository description

    Primary programming language used

    Number of stars

    Direct link to the repository

The search only works when ENTER is pressed.
It must display a "loading state" while searching.
If there are no results, display an "empty state".
In case of an error, display a user-friendly message.

For the request, use fetch.
Place the fetch inside a try/catch block with async/await.
Check the status code to proceed.

All events must be defined in JavaScript, with no events defined in the HTML.

Github API URL to search repositories:
https://api.github.com/search/repositories?q={KEYWORD}&sort=stars&per_page=10

    Replace {KEYWORD} with the term typed by the user.

Visual instructions:

    A card with rounded corners for the search field

    A card with rounded corners for the search results

    A background darker than the cards

    Entire page centered with a content width limit of 700px