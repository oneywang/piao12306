#ifndef DOWNLOAD_HELPER_PLUGIN_H_
#define  DOWNLOAD_HELPER_PLUGIN_H_

#include "plugin_base.h"
#include "script_object_base.h"
#include <vector>

class HelperPlugin : public PluginBase {
public:
  HelperPlugin() {
  }
  virtual ~HelperPlugin() {
  }
    
  NPError Init(NPP instance, uint16_t mode, int16_t argc, char* argn[],
               char* argv[], NPSavedData* saved);
  NPError UnInit(NPSavedData** save);
  NPError GetValue(NPPVariable variable, void *value);
  NPError SetWindow(NPWindow* window);

  static PluginBase* CreateObject() { return new HelperPlugin(); }

private:
  ScriptObjectBase* scriptobject_;
};

#endif  /* HelperPlugin_H */