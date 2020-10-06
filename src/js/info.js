import ServerInfo from './base/plumbing/ServerInfo';

const json = JSON.stringify(ServerInfo);

const container = document.createElement('pre');
container.style.cssText = "word-wrap: break-word; white-space: pre-wrap;";
container.innerHTML = json;

document.body.appendChild(container);
