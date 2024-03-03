export class sessionManager {
    constructor() {
        // Current active sessions
        this.sessions = {};
        // Current active activities for each session
        this.activities = {};
    }
    createSession( socketID ) {
        // make session id
        let sessionID = "S" + socketID;

        // make session data
        this.sessions[ sessionID ] = {
            userData : {},
            activityRequests : []
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
                return sessions[i]
            }
        }

        return null
    }
    joinSession( sessionID, socketID, startingLocation, startingRotation ) {
        // make player data
        let playerData = this.createPlayer( startingLocation, startingRotation );

        // add player data to session using id
        this.sessions[ sessionID ].userData[ socketID ] = playerData;

        console.log(this.sessions[ sessionID ])
    }
    leaveSession( socketID ) {
        let sessionID = this.findSession( socketID );

        if ( sessionID == null ) {
            return null
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
            else {
                console.log(playerCount);
                console.log(Object.keys( this.sessions ));
            }

            return true
        }
    }
    removeSession( sessionID ) {
        delete this.sessions[ sessionID ];

        console.log(`Session ${ sessionID } Was Successfully Removed`);
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
    removeActivity( sessionID, activity) {
        clearInterval( this.activities[ sessionID ][ activity ].interval );

        this.activities[ sessionID ][ activity ] = undefined;
    }
    grabActiveSessions() {
        return Object.keys( this.sessions );
    }
    grabSessionUsers(sessionID) {
        return Object.keys( this.sessions[ sessionID ].userData );
    }
}