#include "stdafx.h"
#include "helper_plugin.h"
#include "helper_script_object.h"
#include "log.h"
#include "script_object_factory.h"

extern Log g_Log;

NPError HelperPlugin::Init(NPP instance, uint16_t mode, int16_t argc,
                                   char* argn[],char* argv[], 
                                   NPSavedData* saved) {
  g_Log.WriteLog("msg", "HelperPlugin Init");
  scriptobject_ = NULL;
  instance->pdata = this;
  return PluginBase::Init(instance, mode, argc, argn, argv, saved);
}

NPError HelperPlugin::UnInit(NPSavedData** save) {
  g_Log.WriteLog("msg", "HelperPlugin UnInit");
  PluginBase::UnInit(save);
  scriptobject_ = NULL;
  return NPERR_NO_ERROR;
}

NPError HelperPlugin::GetValue(NPPVariable variable, void *value) {
  switch(variable) {
    case NPPVpluginScriptableNPObject:
      if (scriptobject_ == NULL) {
        scriptobject_ = ScriptObjectFactory::CreateObject(
            get_npp(), HelperScriptObject::Allocate);
        g_Log.WriteLog("GetValue","HelperPlugin GetValue");
      }
      if (scriptobject_ != NULL) {
        *(NPObject**)value = scriptobject_;
      }
      else
        return NPERR_OUT_OF_MEMORY_ERROR;
      break;
    case NPPVpluginNeedsXEmbed:
      *(bool*)value = 1;
      break;
    default:
      return NPERR_GENERIC_ERROR;
  }

  return NPERR_NO_ERROR;
}

NPError HelperPlugin::SetWindow(NPWindow* window){
  PluginBase::SetWindow(window);
#ifdef  _DEBUG
  MessageBox(NULL, L"NPAPI", L"CHROME NPAPI", 0);
#endif

  return NPERR_NO_ERROR;
}
