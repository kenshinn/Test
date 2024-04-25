addEventListener("message", (channelEvent)=>{
	if(typeof(channelEvent.data)==="string"){
		console.log(`receive channel: ${channelEvent.data}`);
		channelEvent.ports[0].onmessage = (portEvent)=>{
			dispatchEvent(new MessageEvent(channelEvent.data, {data: portEvent.data}));
		};
	}
});