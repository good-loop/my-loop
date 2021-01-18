# copy this to nginx sites-available, also modify etc/hosts

map $sent_http_content_type $expires {
    default                         off;
    text/html                       epoch;
    text/css                        epoch;
    application/javascript          epoch;
    ~image/                         epoch;
}

server {
	listen   80; ## listen for ipv4; this line is default and implied

	root /home/winterwell/my-loop/web;
	index index.html;

    expires $expires;

	server_name localmy.good-loop.com;

	location / {
			try_files $uri $uri/ @backend;
			add_header 'Access-Control-Allow-Origin' "$http_origin";
			add_header 'Access-Control-Allow-Credentials' 'true';
			add_header 'Cache-Control' 'no-cache';
	}

	location @backend {
			proxy_pass              http://localhost:8282;
			proxy_set_header        X-Real-IP $remote_addr;
			proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header        Host $http_host;
	}

}
