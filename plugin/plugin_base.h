#ifndef PLUGIN_BASE_H_
#define PLUGIN_BASE_H_

#include "stdafx.h"
#include "npapi.h"

class PluginBase {
public:
  PluginBase(void) {}
  virtual ~PluginBase(void) {}

  virtual NPError Init(NPP instance, uint16_t mode, int16_t argc, char* argn[],
                       char* argv[], NPSavedData* saved)  {
    npp_ = instance;
    return NPERR_NO_ERROR;
  }
  virtual NPError UnInit(NPSavedData** save){return NPERR_NO_ERROR;}
  virtual NPError SetWindow(NPWindow* window)  {
    window_ = (HWND)window->window;
    return NPERR_NO_ERROR;
  }
  virtual NPError NewStream(NPMIMEType type, NPStream* stream, NPBool seekable,
    uint16_t* stype)  {return NPERR_NO_ERROR;}
  virtual NPError DestroyStream(NPStream* stream, NPReason reason){return NPERR_NO_ERROR;}
  virtual int32_t WriteReady(NPStream* stream){return 0;}
  virtual int32_t Write(NPStream* stream, int32_t offset, int32_t len,
    void* buffer){return 0;}
  virtual void StreamAsFile(NPStream* stream, const char* fname){}
  virtual void Print(NPPrint* platformPrint){}
  virtual int16_t HandleEvent(void* event){return 0;}
  virtual void URLNotify(const char* url, NPReason reason, void* notifyData){}
  virtual NPError GetValue(NPPVariable variable, void *value){return NPERR_NO_ERROR;}
  virtual NPError SetValue(NPNVariable variable, void *value){return NPERR_NO_ERROR;}

  NPP get_npp() const { return npp_; }
  void set_npp(NPP npp) { npp_ = npp; }

  HWND get_hwnd() const { return window_; }
  void set_hwnd(HWND window) { window_ = window; }
  
private:
  NPP npp_;
  HWND window_;
  
};

#endif