# Post Place

Post Place is a social media application where users can make posts and interact with posts by liking and commenting on them.

## How to run the app
(Meant to be used with PostPlace-UI)

1. Fork or clone the github repo and open up the folder in the CLI
2. Install all dependencies (Bring up 2 terminals, cd into client on one and server on the other, run 'npm i' in both.)
3. Hook up an empty MongoDB collection to the server and set a JWT secret, setting them to CONNECTION_URL and JWT_SECRET in an .env file in the server folder.
- If you'd like to seed the database, run 'node dataSeeding' in the server directory.
4. Connect your server to the clientside via .env files in client / server folders.
- Optionally connect a google OAuth clientID to the front end if it isn't too much trouble and/or you want the google login to work.
5. Run the client and server locally via the npm start command.
6. Navigate to the URL you chose for the clientside and the app should be running.

## Features

1. A user can sign up for an account, sign in, sign in via google, or use a guest account.
2. A user can search for posts fitting their criteria.
3. A user can visit registered users' pages where they can see an activity feed.
4. A signed-in user can make, edit, delete, or like posts.
5. A signed-in user can make, delete or like comments tied to a specific post by visiting its page.
6. All actions where applicable will be displayed in real time to all users.
7. Actions are saved to a database so data is persistent across visits.
8. The site has different views dependent on window size and looks normal / functions properly down to 250px width.

### How to search for posts

1. You can search by title or by tags or both on the home page. If searching by title, simply type in the phrase you'd like to search by into the 'Search Posts' input area and then press the SEARCH button.
2. If searching by tags or by tags and title, type in a tag and then press enter. It will appear box as a chip, which you can delete if you want. You can repeat this process to search for multiple tags at once. To initiate the search, press the SEARCH button.

### How to visit an activity feed

1. Visit a post's page.
2. You can click on the creator's name or the commentors' names to visit their activity feeds.

### How to interact with posts

1. Click the sign in button at the top-right and sign up, sign in, or use a guest account. You can now interact with others' posts and comments.
2. The like button is in the bottom left corner of posts. You can click it again to unlike after you've liked a post.

### Making a post

1. Once signed in, fill out the title, message fields and optionally the tag and image fields. Press enter to add tags.
2. Submit and your post will appear for all users in real time, signed in or not.

### Updating and deleting your post

1. If you made a post, a small 3 dot icon (...) will be seen in the top right of the post on the home page. Click it.
2. Adjust the form values and press submit as you did when you first created it.
3. If you'd like to delete your post, a small delete button will be seen in the bottom right of the post.
4. If you press this button, your post will be permanently deleted.

### Making, deleting, and liking comments
1. Click on a post to be directed to its page.
2. Type out a comment in the text field below the picture and other information about the post.
3. Click submit.
4. Liking and deleting work similarly to posts. Click the thumb to like/unlike, click the delete button if you want to delete your comment.

## Future features
- Proper XSS protection. (If you visit the live version please don't blow my site up.)
- Other social media actions like sharing/reposting others' posts.
- Special features if visiting own activity feed page like deletion of all posts / account, quickly edit posts and comments.
- Proper account recovery stuff and email validation.

## Dependencies
- React
- Node
- Express
- MongoDB / mongoose
- moment
- axios
- material-ui core/lab/icons
- redux toolkit
- react-router-dom
- socket.io / socket.io-client
- jwt / jwt-decode
- react-file-base64
- react-google-login
- faker
- cors
- bcrypt
- dotenv