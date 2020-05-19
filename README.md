# CodinGame Spring Challenge 2020

## About
![screenshot](https://raw.githubusercontent.com/LudovicLemaire/CodinGame-Spring-Challenge-2020/master/git_images/FAQ.PNG)

## Score
I finished 3rd in ~45 at my school, and 775th in ~5000 worldwide
![screenshot](https://raw.githubusercontent.com/LudovicLemaire/CodinGame-Spring-Challenge-2020/master/git_images/score.PNG)


## Rules

To win you have to get more Pellets than your opponent.
If you don't give an order within 50ms, you loose.
If you don't have Pacman anymore, you loose.
If you give two orders to the same Pacman, you loose.

There can be a random amount of Pacmans.
Map is always symmetrical.
There is magic portal from left to right.

Your pacmans have random form between Paper/Scissors/Rock. If two opponent Pacman run into each other, and are different form, the looser die. If there are both same form, they block each other.

There is big pellet, than can be seen from anywhere on the map. Small pellets can only be seen acording to your vision (you can't see through wall).

There is 2 spells :
- Speed : your pacman will do 2 turn instead of 1 during 5 turns.
- Switch : your pacman change form to whatever you want.
A spell has a cooldown of 10 turns (that affect both).



## Preview
![screenshot](https://raw.githubusercontent.com/LudovicLemaire/CodinGame-Spring-Challenge-2020/master/git_images/gameFirst.gif)
![screenshot](https://raw.githubusercontent.com/LudovicLemaire/CodinGame-Spring-Challenge-2020/master/git_images/gameSecond.gif)
![screenshot](https://raw.githubusercontent.com/LudovicLemaire/CodinGame-Spring-Challenge-2020/master/git_images/gameThird.gif)


## Overview
**Main**
I put every pellets in an list at the beginning of a match.
Then update that list according to my vision every round.

Decided to not do any pre-calculation nor BFS/A*'s like (challenge with a friend)

Each Pacman go to his closest pellet according to his position and pellet list.
Big pellet have priority other small (so my go to a big one even if a small is closer)

Pacmans can't be too close or have a too close destination. Either way, one will change his destination to a random pellet.
A Pacman doesn't change destination except if the pellet doesn't exist anymore, or if a rule tells him to (too close, been blocked for example)

If a Pacman has same position as old turn, then he's considered as blocked, and get a new destination.

Always launch Speed if cooldown is at zero, expect if an enemy is too close.

**Combat**
I never attack except if enemy is 1 case of me (or 2 if speed) AND if enemy cooldown is above 1).
I flee if an enemy can hit me in the next turn (taking into account speed of both). So my Pacmans can technically never be eaten except if I don't see the oponent, or if he blocked me into a "cave".

If an enemy is same form and cooldown of mine and oponent is 0 and close of <2 case, it keeps same position, so if oponent change form, I will next round, and win the fight.

Flat torus aspect in the X axis is taken into account for everything.

**End**
That CodinGame Challenge was my first, and I pretty much enjoyed it, I may do others in the future !
