# Get it to the Table

## Intent of Application

This app allows users to swipe on games imported from [Board Game Geek](https://www.boardgamegeek.com/) collections. It's like Tinder for tabletop games!

##### [Link to Live App](https://get-it-to-the-table.vercel.app/)

##### [Server Repo](https://github.com/christorepl/get-it-to-the-table-server)

![screenshot-1](https://raw.githubusercontent.com/christorepl/gittt-client/main/src/img/swiping.gif)

Swiping on games and checking out linked info

## Technologies

### Back-end

- Node.js
- Express
- jwtAuth
- axios
- Postgresql
- Heroku Deployment

### Testing

- Mocha
- Chai
- Supertest

### Front-end

- React
- Vercel Deployment
- JSX
- CSS

### API used for BGG Collections:

[BGG XML API](https://boardgamegeek.com/wiki/page/BGG_XML_API)

## Authentication

| Method | Endpoint    | Usage               | Returns |
| ------ | ----------- | ------------------- | ------- |
| POST   | /auth/login | Authenticate a user | JWT     |

### `/auth/login`

#### POST

Endpoint for authenticating users

##### Request Body

| Type | Fields                    | Description                                    |
| ---- | ------------------------- | ---------------------------------------------- |
| JSON | user_email, user_password | JSON containing a username and password string |

##### Responses

| Code | Description                                                    |
| ---- | -------------------------------------------------------------- |
| 200  | Receive JWT with authenticated user_name and id inside payload |
| 400  | Missing '{user_name OR password}' in request body              |
| 400  | Incorrect user_name or password                                |

## User Registration

| Method | Endpoint       | Usage             | Returns     |
| ------ | -------------- | ----------------- | ----------- |
| POST   | /auth/register | Register new user | User Object |

### `/auth/register`

#### POST

Endpoint for registering new users

##### Request Body

| Type | Fields                               | Description                                       |
| ---- | ------------------------------------ | ------------------------------------------------- |
| JSON | user_name, user_email, user_password | JSON containing username, email, password strings |

##### Responses

| Code | Description                                                            |
| ---- | ---------------------------------------------------------------------- |
| 201  | Respond with JWT                                                       |
| 400  | Missing '{user_name OR email OR password}' in request body             |
| 400  | Error response object containing a number of validation error messages |
| 401  | JSON response object containing message that user already exists       |

### `/auth/verify`

#### GET

Endpoint for authenticating users already logged in and populating their user data - groups, contacts, collections, and so on.

##### Request Body

| Type | Fields  | Description             |
| ---- | ------- | ----------------------- |
| JSON | user_id | JSON containing user_id |

##### Responses

| Code | Description                        |
| ---- | ---------------------------------- |
| 200  | Respond with authentication status |
| 401  | Unauthorized                       |

### `/auth/delete-account`

#### DELETE

Endpoint for deleting a user account

##### Request Body

| Type | Fields         | Description                                |
| ---- | -------------- | ------------------------------------------ |
| JSON | user.id, email | JSON containing user's id and user's email |

##### Responses

| Code | Description                                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 200  | Respond with JSON containing message that account was successfully deleted                                  |
| 500  | Respond with JSON containing message that there was a server error, that there may be a typo in their email |

### `/bgg/add-collection/`

#### POST

Endpoint for adding BGG collections to user account.

##### Request Body

| Type | Fields                           | Description                                                            |
| ---- | -------------------------------- | ---------------------------------------------------------------------- |
| JSON | list_name, bgg_username, user.id | JSON containing user id, BGG username and user defined collection name |

##### Responses

| Code | Description                                                               |
| ---- | ------------------------------------------------------------------------- |
| 201  | Respond with JSON containing message that collection was added to account |
| 500  | Server error                                                              |
| 401  | Unauthorized user                                                         |

### `/swiper/:group_id`

#### GET

Endpoint for populating swipe cards

##### Request Body

| Type | Fields            | Description                                                                |
| ---- | ----------------- | -------------------------------------------------------------------------- |
| JSON | group_id, user.id | JSON containing user id and pertinent group_id that user wants to swipe on |

##### Responses

| Code | Description                                                                  |
| ---- | ---------------------------------------------------------------------------- |
| 200  | Response with JSON containing all games' data                                |
| 500  | Error message when user somehow tries to swipe on a group that doesn't exist |
| 401  | Unauthorized user                                                            |

### `/swiper/:group_id`

#### PUT

Endpoint for updating tables with swiping information

##### Request Body

| Type       | Fields                     | Description                                                       |
| ---------- | -------------------------- | ----------------------------------------------------------------- |
| JSON       | game_name, swipe_direction | JSON containing user's id, name of game and direction they swiped |
| Parameters | group_id                   | The group_id that the user is swiping on                          |

##### Responses

| Code | Description                                                                           |
| ---- | ------------------------------------------------------------------------------------- |
| 400  | Response with JSON containing message that the group does not exist                   |
| 200  | Response with JSON containing message that the game is a match, everyone swiped right |
| 200  | Response with JSON contaning info that the swipe was recorded                         |
| 500  | Response with JSON containing message that there was a Server error                   |

### `/contacts`

#### POST

Endpoint for adding contacts to a user's account

##### Request Body

| Type | Fields                            | Description                                                              |
| ---- | --------------------------------- | ------------------------------------------------------------------------ |
| JSON | user.id, contact_name, contact_id | JSON containing user's id, contact's id, and contact's user defined name |

##### Responses

| Code | Description                                                                         |
| ---- | ----------------------------------------------------------------------------------- | --- | --------------------------------------------------------------------- |
| 412  | Response with JSON containing msg that user cannot add themselves to their contacts |
| 412  | Response with JSON containing msg that user already has that contact                | 200 | Response with JSON containing msg that contact was successfully added |
| 500  | Response with JSON containing msg that contact id is invalid                        |

### `/group/add_collection`

#### POST

Endpoint for adding a BGG collection to a group

##### Request Body

| Type | Fields                           | Description                                                                 |
| ---- | -------------------------------- | --------------------------------------------------------------------------- |
| JSON | user.id, group_id, collection_id | JSON containing user's id, group_id to add to and collection_id to be added |

##### Responses

| Code | Description                                                                                         |
| ---- | --------------------------------------------------------------------------------------------------- |
| 400  | Response with JSON containing msg that the selected group already has the selected collection in it |
| 201  | Response with JSON containing msg that the collection was added to the group                        |
| 500  | Response with JSON containing msg that there was a server error                                     |

### `/group/create`

#### POST

Endpoint for creating a new user group

##### Request Body

| Type | Fields                             | Description                                                                                            |
| ---- | ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| JSON | user.id, newGroupName, contact_ids | JSON containing user's id, the new group's name, and the id's of the contacts to be added to the group |

##### Responses

| Code | Description                                                                           |
| ---- | ------------------------------------------------------------------------------------- |
| 203  | Response with JSON containing msg that user already owns a group with that name       |
| 203  | Response with JSON containing msg that user alreadys owns a group with those contacts |
| 201  | Response with JSON containing msg that group was created                              |
| 500  | Server error                                                                          |
