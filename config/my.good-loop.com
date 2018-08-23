# copy this to nginx sites-available, also modify etc/hosts
server {
	listen   80; ## listen for ipv4; this line is default and implied

	root /home/irina/winterwell/my-loop/web;
	index index.html;

	server_name localmy.good-loop.com;

	location / {
			try_files $uri $uri/ index;
			add_header 'Access-Control-Allow-Origin' "$http_origin";
			add_header 'Access-Control-Allow-Credentials' 'true';
	}
}
