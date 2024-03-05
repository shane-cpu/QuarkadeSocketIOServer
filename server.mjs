import http from 'http';
import { Server } from 'socket.io';

import { sessionManager } from './sessionManager.mjs';
import { serverMathHelper } from "./serverMathFunctions.mjs";
import { tankGameTemplate } from "./TankGame.mjs";

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",  // Allows access from any origin
    methods: ["GET", "POST"],  // Allows GET and POST requests
    allowedHeaders: ["my-custom-header"],  // Custom headers you wish to allow (if any)
    credentials: true  // Allows credentials (cookies, authorization headers, etc.)
  }
});
const port = 3000;

// let userData = {}
let unhandledUsers = [];

let unhandledRequests = [];

const mathHelper = new serverMathHelper();
const sessionManagerInstance = new sessionManager();
// const tankGameInst = new tankGameTemplate(mathHelper, userData);

io.on( 'connection', ( socket ) => {
  console.log( 'A user connected, new user ID :', socket.id);

  unhandledUsers.push( socket.id );

  socket.emit("recieveSessionNames", { sessions : sessionManagerInstance.grabActiveSessions() });

  socket.on("joinSession", ( packet ) => {
    console.log( packet.message );

    socket.emit('requestTransform', { connectionID : socket.id, sessionID : packet.sessionID });
  });

  socket.on("makeSession", ( packet ) => {
    console.log( packet.message );

    let sessionID = sessionManagerInstance.createSession( socket.id );

    socket.emit('requestTransform', { connectionID : socket.id, sessionID : sessionID });
  });

  socket.on('serveTransformRequest', ( returnData ) => {
    unhandledUsers.splice(unhandledUsers.indexOf(socket.id), 1);

    sessionManagerInstance.joinSession( 
      returnData.sessionID,
      socket.id,
      mathHelper.MakeVector3( returnData.pos.x, returnData.pos.y, returnData.pos.z ),
      mathHelper.MakeQuaternion( returnData.rot.x, returnData.rot.y, returnData.rot.z, returnData.rot.w )
    );

    socket.emit( "sessionJoined", { "message" : "You Have Joined A Session", sessionData : grabSessionState( returnData.sessionID ), socketID : socket.id } );
  });

  socket.on('playerRequest', ( playerData ) => {
    let newRequest = {
      "sessionID" : playerData.sessionID,
      "socketID" : playerData.socketID,
      "requestType" : playerData.requestType, // updatePlayerTransform
      "requestedData" : playerData.requestedData // { position : {}, rotation : {} }
    }

    unhandledRequests.push( newRequest )
  });

  socket.on('disconnect', ( reason ) => {
    let activeSession = sessionManagerInstance.findSession( socket.id );
    let wasInSession = sessionManagerInstance.leaveSession( socket.id );

    if ( wasInSession == null ) {
      unhandledUsers.splice( unhandledUsers.indexOf(socket.id), 1 );

      console.log( 'User Was Removed From Unhandled Users.' );
    }
    else {
      console.log( 'User Was Removed From Current Session.' );
      
      if ( activeSession in sessionManagerInstance.sessions ) {
        let users = sessionManagerInstance.grabSessionUsers( activeSession )

        users.forEach(( userID ) => {
          io.to( userID ).emit(  'removeUser', { socketID : socket.id });
        });
      }
    }

    console.log( `User With ID ${socket.id} Disconnected: ${reason}` );

    // socket.broadcast.emit('playerDisconnect', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log( `Server running on http://localhost:${port}` );
});

let mainInterval = setInterval( () => {
  let currentlyHandling = unhandledRequests.slice(); // This is a copy of the current array being managed
  unhandledRequests = [];

  if ( currentlyHandling.length > 0 ) {

    let modifiedSessions = sessionManagerInstance.grabActiveSessions() //[]

    for ( let i = 0; i < currentlyHandling.length; i++ ) {
      if ( currentlyHandling[i].requestType == "updatePlayerTransform" ) { // Updating the player's transform
        sessionManagerInstance.updatePlayerData( currentlyHandling[i].socketID, currentlyHandling[i].sessionID, currentlyHandling[i].requestedData.position, currentlyHandling[i].requestedData.rotation );

        if ( !modifiedSessions.includes( currentlyHandling[i].sessionID ) ) {
          modifiedSessions.push( currentlyHandling[i].sessionID );
        }
      }
    }

    for ( let i = 0; i < modifiedSessions.length; i++ ) {
      let users = sessionManagerInstance.grabSessionUsers( modifiedSessions[i] );
      let updatedUsers = sessionManagerInstance.grabUpdatedUsers( modifiedSessions[i] );
      
      let changes = {}

      for ( let j = 0; j < updatedUsers.length; j++ ) {
        // changes[ users[j] ] = sessionManagerInstance.grabUser( users[j], modifiedSessions[i] );
        changes[ updatedUsers[j] ] = sessionManagerInstance.grabUser( updatedUsers[j], modifiedSessions[i] );
      }

      for ( let j = 0; j < users.length; j++ ) {
        io.to( users[j] ).emit( 'updateSessionState', changes );
      }

      sessionManagerInstance.clearUpdatedUsers( modifiedSessions[i] );
    }
  }
}, 1000/60 );

function grabSessionState( sessionID ) {
  let users = sessionManagerInstance.grabSessionUsers( sessionID );
  
  let changes = {}

  for ( let j = 0; j < users.length; j++ ) {
    changes[ users[j] ] = sessionManagerInstance.grabUser( users[j], sessionID );
  }

  return changes
}