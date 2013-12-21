vacation
====================
vacation has two tools, build and server.  

**learn & use => [wiki](https://github.com/peichao01/vacation/wiki)**


server
------------------
vacation server now is still beta now, its goal is to be a express-like server for the front ent developers, the first step is serves for the static contents like html,css,javascript etc. and the second step is feed it a server.js file to serves for every dynamic content like a real server.

build
---------------------
the build tools is designed for the [seajs](https://github.com/seajs/seajs) workflow. seajs is like require.js but the different specification called CMD.
seajs has a brother called SPM,but the latest version of it is focus on the package manager, not the build tool, so vacation build appeared to resolve the problems, it holps to adapt different directory structure, and got some inspiration from [FIS](https://github.com/fis-dev/fis) that generate a map.json file that you can get all informations of your source files in this file.

---------------------

get help information
------
`vacation -h`,`vacation init -h`,`vacation server -h`, `vacation build -h`

`vacation init config`
----
initialize a `vacation.json` file in the current-work-directory.  
1. `vacation init config -f` force to overwrite a config file if it had exists already.

`vacation server start`
----
start a server for the develope purpose and point the `www` dir to the current dir.

`vacation build start`
----
the config file should be provided if you need to use this command.  
