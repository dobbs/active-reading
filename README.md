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

# next steps

- [ ] decide if <welcome-active-reader> should listen for capabilities
      and hold the .save() method
- [ ] create a visible form to save details through to the notebook
- [ ] extend the visible docs to reveal the multiple domain name support
- [ ] extend the visible docs to link to the browse view
- [ ] implement download or drag of wiki export files
- [ ] experiment with variant of notebook.html browser that runs
      inside a wiki frame and invites the reader to open ghost pages
      from the data in the notebook.
- [ ] experiment with collecting notes into the notebook via
      copy-n-paste or drag-n-drop to extend the possible sources
