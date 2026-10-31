(function(){
  if(!window.Capacitor?.isNativePlatform?.())return;
  var share=window.Capacitor.Plugins?.Share;
  var fs=window.Capacitor.Plugins?.Filesystem;
  if(!share||!fs)return;
  var nativeShare=async function(data){
    if(!data||!Array.isArray(data.files)||!data.files.length)return share.share({title:data?.title||'Winzera',text:data?.text||''});
    var paths=[];
    for(var file of data.files){
      var raw=await new Promise(function(resolve,reject){
        var reader=new FileReader();
        reader.onload=function(){resolve(String(reader.result).split(',')[1]);};
        reader.onerror=reject;
        reader.readAsDataURL(file);
      });
      var filename=String(file.name||'winzera.png').replace(/[^a-zA-Z0-9._-]/g,'_');
      var name='share-'+Date.now()+'-'+Math.random().toString(36).slice(2)+'-'+filename;
      await fs.writeFile({path:name,data:raw,directory:'CACHE',recursive:true});
      var uri=await fs.getUri({path:name,directory:'CACHE'});
      paths.push(uri.uri);
    }
    return share.share({title:data.title||'Winzera',text:data.text||'',files:paths,dialogTitle:'Share from Winzera'});
  };
  // Existing shareResultImage checks canShare before calling share.
  try{
    Object.defineProperty(navigator,'canShare',{configurable:true,value:function(data){return !!(data&&data.files&&data.files.length);}});
    Object.defineProperty(navigator,'share',{configurable:true,value:nativeShare});
  }catch(e){
    console.warn('Winzera native sharing shim unavailable',e);
  }
})();