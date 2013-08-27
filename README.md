Mythos As A Service
===================

Mythos As A Service is a simple online generator of Cthulhoid entities -- that is, 
Great Old Ones, creatures and strange peoples from Lovecraft Country. 

Tech-wise, it is a simple Express project coupled with a random cthulhoid name generator and 
a list of outré adjectives. 

It is both a web app and a JSON service source. 

Is this software used somewhere?
--------------------------------

It certainly is: http://mythos.lamboz.net

Services Exposed:
-----------------

* <tt>/json/mythos/:num</tt> : Generates <tt>num</tt> lovecraftian creatures. Default is 1
* <tt>/json/eldergods/:num</tt> : Generates <tt>num</tt> Elder Gods (similar to <tt>mythos</tt>, indeed)
* <tt>/json/people/:num</tt> : Generates <tt>num</tt> peoples worshipping some Dark God here and there. 
* <tt>/json/names/:num<tt> : Generates <tt>num</tt> cthulhoid names
* <tt>/json/adjectives/:num<tt> : Generates <tt>num</tt> lovecraftian adjectives

Running it
----------

<tt>npm install</tt> to install required modules

<tt>node mythos.js</tt> to have Mythos as a Service running on port 51666



