# PROJECT NIXIE

## Enemy types

- **Grunt**: Weak target. Usually used with weak weapons and straight paths going out.
- **Patrol**: Reasonable target. Usually used with regular weapons and patrol paths staying in. Warning: this enemy always keeps a rotation towards the
bottom of the screen.
- **EasiestBoss**: High health enemy (not too much, it's the first boss). Usually used with shotguns and zigzag paths. Warning: this enemy always keeps
a rotation towards the bottom of the screen.
- **EasiestBossAiming**: Same as the previous enemy, but this one aims in front of it. This allows it to take circular paths instead.
- **EasyBoss**: Higher health enemy. Usually used with circular weapons and circular paths. It slowly rotates every frame (to allow circular weapons to
be less predictable).

## Enemy guns

- **NoPewPew**: No weapon.
- **LameEnemyPewPew**: Shoots one regular projectile.
- **LameConeEnemyPewPew**: Shoots 3 spreaded regular projectiles in a cone.
- **LameShotgunEnemyPewPew**: Shoots 3 regular projectiles in a small cone, giving a shotgun effect.
- **LameLargeShotgunEnemyPewPew**: Shoots 4 regular projectiles in a small cone, giving a larger shotgun effect.
- **CircularEnemyPewPew**: Shoots 23 projectiles evenly spreaded around the enemy, spreading bullets all accross the screen.

## Enemy paths
Note: All the **50**s represent the max width of an enemy. They are there to make sure no enemy **spawns** in-screen, instead of off-screen.
- **TopLeftBottomRight**: Chases the bottom right of the screen starting from its current position. Recommended starting position: (from 50 to SCREEN_W/2, -50)
- **TopRightBottomLeft**: Chases the bottom left of the screen starting from its current position. Recommended starting position: (from SCREEN_W/2-50 to SCREEN_W-50, -50)

- **LeftRight**: Chases the right of the screen starting from its current position. Recommended starting position: (-50, from 50 to SCREEN_H-50)
- **RightLeft**: Chases the left of the screen starting from its current position. Recommended starting position: (SCREEN_W+50, from 50 to SCREEN_H-50)
- **TopBottom**: Chases the bottom of the screen starting from its current position. Recommended starting position: (from 50 to SCREEN_W-50, -50)
- **BottomTop**: Chases the top of the screen starting from its current position. Recommended starting position: (from 50 to SCREEN_W-50, SCREEN_H+50)
- **PatrolHorizontalStartLeft**: Starts from the top of the screen, goes to a certain y position, then patrols left/right. Recommended starting position: (from 50 to SCREEN_W-50, -50)
- **PatrolHorizontalStartRight**: Starts from the top of the screen, goes to a certain y position, then patrols right/left. Recommended starting position: (from 50 to SCREEN_W-50, -50)
- **ZigZagStartLeft**: Starts from the top of the screen, goes to a certain y position, then patrols left/right while going up/down. Recommended starting position: (from 50 to SCREEN_W-50, -50)
- **ZigZagStartRight**: Starts from the top of the screen, goes to a certain y position, then patrols right/left while going up/down. Recommended starting position: (from 50 to SCREEN_W-50, -50)
- **CircleStartLeft**: Starts from the top of the screen, goes to a certain y position, then patrols in a circle-like fashion, counter-clockwise. Recommended starting position: (from 50 to SCREEN_W-50, -50)
- **CircleStartRight**: Starts from the top of the screen, goes to a certain y position, then patrols in a circle-like fashion, clockwise. Recommended starting position: (from 50 to SCREEN_W-50, -50)



## Player guns
- **PlayerFastPewPew**: Pretty fast lame weapon.
- **PlayerParrallelFastPewPew**: Fast weapon that shoots two parrallel projectiles.
- **PlayerFastPewPewSplit3**: Normal speed weapon that shoots 3 projectiles in a cone.
- **PlayerFastPewPewSplit5**: Slightly slower weapon that shoots 5 projectiles in a cone.
- **PlayerMelee**: Pretty fast weapon that shoots ammo that slowly fades out. It is meant to be used close to the enemy, as it's damage
depends on the range (closer means higher damage, far away means close to no damage).
- **PlayerHomingPewPew**: Slow weapon that deals high amounts of damage and chases the enemies that are close enough to it.
- **PlayerFireBigPewPew**: Instant weapon that deals damage on frame to the enemies in its ray. (**IMMA FIRIN' MY LAZER**)
- **PlayerForkYou**: Very fast weapon that deals high amounts of damage to enemies. It is the ultimate weapon, pretty much.



## Powerups
- **ShieldPowerup**: Gives additional protection, blocking damage until it is destroyed.
- **HealPowerup**: Restores a certain amount of health to the player that picks it.