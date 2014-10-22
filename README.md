d-test4
=======

d-test4 is a modified derby-examples/directory and can be used to reproduce a Derby bug.

Derby bug is this: sometimes the subscription for an item is dropped too soon. This happens about 10 % of the time.

Reproduce like this:

- Add some (5-10) people into the directory
- Follow some/all of those people (click the follow button)
- Go to the Followed page
- Click a person, you'll see the edit page
- Click Unfollow. At this point, if the bug happens, the person info will go blank i.e. person data subscription is "dropped".
- If the bug doesn't happen, go to Followed page and select another person etc.

This should happen at least 10 % of the time (once in 10 persons).


