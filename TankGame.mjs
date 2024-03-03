export class tankGameTemplate {
    constructor( helper, userData ) {
        this.mathHelper = helper;
        
        this.reflectSpeed = 2;

        this.interval = setInterval( () => {
            this.updatePlayers(userData)
            
            emitUserData()
        }, 1000/60);
    }
    generatePlayer( playerPos, playerRot ) {
        return {
          playerPos : playerPos,
          playerVel : { x : 0, y : 0, z : 0 },
          playerRot : playerRot
        }
    }
    updatePlayers(userData) {
        let userKeys = Object.keys(userData)

        for (let i = 0; i < userKeys.length; i++) {
            let user = userData[userKeys[i]]

            if (user == undefined) {
                continue
            }

            let velocity = { x : 0, y : 0, z : 0 };
            let forwardInput = 0;
            let forwardVector = { x : Math.cos( user.playerData.playerRot ), y : 0, z : Math.sin( user.playerData.playerRot ) };

            if (user.playerInputs[0] == 1) {
                forwardInput += 1;
            }
            if (user.playerInputs[1] == 1) {
                forwardInput -= 1;
            }

            let rotationInput = 0

            if (user.playerInputs[2] == 1) {
                rotationInput -= 4;
            }
            if (user.playerInputs[3] == 1) {
                rotationInput += 4;
            }

            user.playerData.playerRot += (rotationInput) * (1/60)

            if (user.playerData.playerRot < Math.PI * 2) {
                user.playerData.playerRot = user.playerData.playerRot - (Math.PI * 2);
            }
            else if (user.playerData.playerRot < 0) {
                user.playerData.playerRot = user.playerData.playerRot + (Math.PI * 2);
            }

            let reflectVelicity = { x : 0, y : 0 };

            for (let j = 0; j < userKeys.length; j++) {
                if (userKeys[i] != userKeys[j]) {
                    let user2 = userData[userKeys[j]]

                    let userPos1 = { x :  user.playerData.playerPos.x, y :  user.playerData.playerPos.z }
                    let userPos2 = { x : user2.playerData.playerPos.x, y : user2.playerData.playerPos.z }

                    if (this.mathHelper.CheckUsersColliding( userPos1, userPos2, 1 ) == true) {
                        let reflectDirection = this.mathHelper.CalcNormalizedDirection( userPos1, userPos2)

                        if (reflectDirection != undefined) {
                            reflectVelicity.x += reflectDirection.x
                            reflectVelicity.y += reflectDirection.y
                        }
                    }
                }
            }

            let reflectionResult = this.mathHelper.NormalizeDirection( reflectVelicity );

            if (reflectionResult != undefined) {
                reflectVelicity = reflectionResult;
            }

            velocity.x = forwardVector.x * forwardInput;
            velocity.z = forwardVector.z * forwardInput;

            user.playerData.playerVel.x += velocity.x + (-reflectVelicity.x * this.reflectSpeed)
            user.playerData.playerVel.z += velocity.z + (-reflectVelicity.y * this.reflectSpeed)

            user.playerData.playerPos.x += user.playerData.playerVel.x * (1/60)
            user.playerData.playerPos.z += user.playerData.playerVel.z * (1/60)

            user.playerData.playerVel.x *= 0.9
            user.playerData.playerVel.z *= 0.9
        }
    }
}