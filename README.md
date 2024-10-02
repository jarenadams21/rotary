... you shouldn't be here ...

for loop mods:

for (i = 0; i*50)

this syntax will auto handle increment or decerement by 1 depending on start and end values.

an optional rule can be provided to control index control : for (i = 0; i*50; i + 1)

notice how we pass directly the logic, no i =. a lot of interpretation for easier shorthands.

OR

from ( i = 0 to 50 )

from ( _blank_ = _value1_ to _value2_ )

* auto handle as before *

or allow : from ( _blank_ = _value1_ to _value2_ : _rule_)

controlled index lookaheads, and optional loop update rule passing.

THEN,

Test performance against V8.
