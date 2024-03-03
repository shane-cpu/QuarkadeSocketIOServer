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
let unhandledUsers = []

const mathHelper = new serverMathHelper();
const sessionManagerInstance = new sessionManager();
// const tankGameInst = new tankGameTemplate(mathHelper, userData);

io.on( 'connection', ( socket ) => {
  console.log( 'A user connected, new user ID :', socket.id);

  unhandledUsers.push(socket.id)

  socket.emit("recieveSessionNames", { sessions : sessionManagerInstance.grabActiveSessions() });

  socket.on("joinSession", ( packet ) => {
    console.log( packet.message );

    socket.emit('requestTransform', { connectionID : socket.id, sessionID : packet.sessionID });
  });
  socket.on("makeSession", ( packet ) => {
    console.log( packet.message )

    let sessionID = sessionManagerInstance.createSession( socket.id )

    socket.emit('requestTransform', { connectionID : socket.id, sessionID : sessionID });
  });

  socket.on('serveTransformRequest', ( returnData ) => {
    unhandledUsers.splice(unhandledUsers.indexOf(socket.id), 1);

    sessionManagerInstance.joinSession( 
      returnData.sessionID,
      socket.id,
      mathHelper.MakeVector3( returnData.pos.x, returnData.pos.y, returnData.pos.z ),
      mathHelper.MakeQuaternion( returnData.rot.x, returnData.rot.y, returnData.rot.z, returnData.rot.w )
    )

    socket.emit( "sessionJoined", { "message" : "You Have Joined A Session" } );
  });
  // socket.on('updateInputs', ( inputData ) => {
  //   userData[inputData.playerID].playerInputs = inputData.inputs;
  // });
  socket.on('disconnect', ( reason ) => {
    let wasInSession = sessionManagerInstance.leaveSession( socket.id );

    if ( wasInSession == null ) {
      unhandledUsers.splice(unhandledUsers.indexOf(socket.id), 1);

      console.log('User Was Removed From Unhandled Users.')
    }
    else {
      console.log('User Was Removed From Current Session.')
    }

    console.log(`User With ID ${socket.id} Disconnected: ${reason}`);

    // socket.broadcast.emit('playerDisconnect', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

function emitUserData() {
  let userPackage = []

  let userIDs = Object.keys(userData)

  userIDs.forEach((ID) => {
    if (userData[ID] != undefined) {
      userPackage.push({
        playerID : ID,
        playerData : userData[ID].playerData
      });
    }
  });

  io.emit( 'updateUserData', userPackage )
}