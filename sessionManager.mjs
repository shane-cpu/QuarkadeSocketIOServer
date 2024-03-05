export class sessionManager {
    constructor() {
        // Current active sessions
        this.sessions = {};
        // Current active activities for each session
        this.activities = {};
    }
    clearUpdatedUsers( sessionID ) {
        this.sessions[ sessionID ].updatedUsers = [];
    }
    createSession( socketID ) {
        // make session id
        let sessionID = "S" + socketID;

        // make session data
        this.sessions[ sessionID ] = {
            userData : {},
            activityRequests : [],
            updatedUsers : []
        };

        // make activity data
        this.activities[ sessionID ] = {
            activity1 : undefined,
            activity2 : undefined
        };
        
        // return session id
        return sessionID;
    }
    createPlayer( startingLocation, startingRotation ) {
        return {
            position : startingLocation,
            rotation : startingRotation,
            moveInput : [0, 0, 0, 0], // w up, s down, a left, d right
            extraInputKeys : {} // This will store other inputs used for the games
        }
    }
    findSession( socketID ) {
        // grab current activities
        let sessions = Object.keys( this.sessions );
        
        // check the activity ids
        for (let i = 0; i < sessions.length; i++) {
            let users = Object.keys( this.sessions[sessions[i]].userData );

            // is there an available activity?
            if (users.includes(socketID)) {
                // add activity instance to the acivities object
                return sessions[i];
            }
        }

        return null
    }
    grabActiveSessions() {
        return Object.keys( this.sessions );
    }
    grabSessionUsers( sessionID ) {
        return Object.keys( this.sessions[ sessionID ].userData );
    }
    grabUpdatedUsers( sessionID ) {
        return this.sessions[ sessionID ].updatedUsers.slice();
    }
    grabUser( socketID, sessionID ) {
        return {
            "position" : this.sessions[ sessionID ].userData[ socketID ].position ,
            "rotation" : this.sessions[ sessionID ].userData[ socketID ].rotation
        }
    }
    joinSession( sessionID, socketID, startingLocation, startingRotation ) {
        // make player data
        let playerData = this.createPlayer( startingLocation, startingRotation );

        // add player data to session using id
        this.sessions[ sessionID ].userData[ socketID ] = playerData;

        // console.log(this.sessions[ sessionID ]);
    }
    leaveSession( socketID ) {
        let sessionID = this.findSession( socketID );

        if ( sessionID == null ) {
            return null;
        }
        else {
            // remove player info from session
            delete this.sessions[ sessionID ].userData[ socketID ];

            // grab the player count
            let playerCount = Object.keys( this.sessions[ sessionID ].userData ).length;

            // remove session if no more player's in session
            if ( playerCount == 0 ) {
                this.removeSession( sessionID );
            }
            // else {
            //     console.log(playerCount);
            //     console.log(Object.keys( this.sessions ));
            // }

            return true
        }
    }
    removeSession( sessionID ) {
        delete this.sessions[ sessionID ];

        console.log(`Session ${ sessionID } Was Successfully Removed`);
    }
    removeActivity( sessionID, activity) {
        clearInterval( this.activities[ sessionID ][ activity ].interval );

        this.activities[ sessionID ][ activity ] = undefined;
    }
    startActivity( sessionID, activityInstance ) {
        // grab current activities
        let activities = Object.keys( this.activities[ sessionID ] );
        
        // check the activity ids
        for (let i = 0; i < activities.length; i++) {
            // is there an available activity?
            if (this.activities[ sessionID ][ activities[i] ] == undefined) {
                // add activity instance to the acivities object
                this.activities[ sessionID ][ activities[i] ] = activityInstance;
            }
        }
    }
    updatePlayerData( socketID, sessionID, position, rotation ) {
        this.sessions[ sessionID ].userData[ socketID ].position = position;
        this.sessions[ sessionID ].userData[ socketID ].rotation = rotation;

        this.sessions[ sessionID ].updatedUsers.push( socketID );
    }
}