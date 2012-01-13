#ifndef DOWNLOAD_HELPER_SCRIPT_OBJECT_H_
#define  DOWNLOAD_HELPER_SCRIPT_OBJECT_H_

#include <string>
#include "script_object_base.h"

class HelperScriptObject :public ScriptObjectBase {
protected:
  HelperScriptObject() {}
  virtual ~HelperScriptObject() {}

public:
  static NPObject* Allocate(NPP npp, NPClass *aClass);

  void InitHandler();

  void Deallocate();
  void Invalidate() {}
  bool Construct(const NPVariant *args,uint32_t argCount,
                 NPVariant *result) { return true; }

public:
  bool IsInstalled(const NPVariant *args, uint32_t argCount,
                    NPVariant *result);
  bool Install(const NPVariant *args, uint32_t argCount,
                    NPVariant *result);
};

#endif  /* HelperScriptObject_H */

