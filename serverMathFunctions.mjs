
export class serverMathHelper {
    constructor() {

    }
    CalcDistance( point1, point2 ) {
        return Math.sqrt( Math.pow( point2.x - point1.x, 2 ) + Math.pow( point2.y - point1.y, 2 ) );
    }
    CalcDirection( point1, point2 ) {
        return { x : point2.x - point1.x, y : point2.y - point1.y };
    }
    CalcLength( vector ) {
        return Math.sqrt( Math.pow( vector.x, 2 ) + Math.pow( vector.y, 2 ) );
    }
    CalcNormalizedDirection( point1, point2 ) {
        let directionVector = this.CalcDirection( point1, point2 );
        let length = this.CalcLength( directionVector );

        if ( length > 0 )
            return { x : directionVector.x/length, y : directionVector.y/length };
        else
            return undefined;
    }
    CheckUsersColliding( user1Pos, user2Pos, userSize ) {
        return this.CalcDistance( user1Pos, user2Pos ) < userSize*2;
    }
    NormalizeDirection( vector ) {
        let length = this.CalcLength( vector );

        if ( length > 0 )
            return { x : vector.x/length, y : vector.y/length };
        else
            return undefined;
    }
    MakeVector2(x, y) {
        return { x : x, y : y };
    }
    MakeVector3(x, y, z) {
        return { x : x, y : y, z : z };
    }
    MakeQuaternion(x, y, z, w) {
        return { x : x, y : y, z : z, w : w };
    }
}