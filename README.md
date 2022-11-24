# Active Reading

Exploring current browser affordances for use in local-first software
development informed by experience collaborating in federated wiki.

Experiment in making software a good team player that serves the
reader. What will we discover when the software reveals how it is
modeling the reader. I believe a reader will more easily diagnose and
adapt to surprising behavior from the software when they can see for
themselves where the software has misunderstood or where it is
misrepresenting them.

Realized this might also serve as an example of using code to learn
(as opposed to the conventional story that code is for automating
things)

# running locally

    file_server -p 1080

visit http://id.localhost:1080/id

# things in my head not yet in this code

- [X] create UX to reveal ability to save
  - https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API/Using
  - [X] add stage in state machine to requestStorageAccess()
  - [X] test again that #browse() can see data saved through #listen()
- [ ] improve separation of concerns in the code
- [X] add a layer to the storage index for page titles
- [ ] introduction and navigation to reveal the path ahead
- [ ] example in a third domain: reveal multi-domain mashup
- [X] storage browser: reveal intended path of re-discovery
