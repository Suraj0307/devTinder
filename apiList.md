# DevTinder APIs

## authRouter
- POST /signup
- POST /login
- POST /logout


## profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password


## connectionRequestRouter
- POST /request/send/:status/:userId
- POST /request/send/accepted/:requestId
- POST /request/send/rejected/:requestId


## userRouter
- GET /user/connections
- GET /user/requests
- GET /user/feed - Gets you the profile of other users on platform




