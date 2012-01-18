/*
 *  12306 Booking Helper Extension for Google Chrome and Chrome-base browsers such as 360chrome.
 *  Copyright (C) 2012 Landman
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */
#include "stdafx.h"
#include "npfunctions.h"
#include "plugin_factory.h"

HMODULE g_hMod;
//Log g_Log;

extern NPNetscapeFuncs* g_NpnFuncs;

BOOL OSCALL DllMain(HMODULE hModule, DWORD reason, LPVOID lpReserved) {
  g_hMod = hModule;
  switch(reason) {
    case DLL_PROCESS_ATTACH:
      //g_Log.OpenLog("Notify");
      //g_Log.WriteLog("Msg","DLL_PROCESS_ATTACH");
      break;
    case DLL_THREAD_ATTACH:
      break;
    case DLL_THREAD_DETACH:
      break;
    case DLL_PROCESS_DETACH:
      //g_Log.WriteLog("Msg","DLL_PROCESS_DETACH");
      break;
  }
  return TRUE;
}

#ifdef __cplusplus
extern "C" {
#endif
  NPError OSCALL NP_GetEntryPoints(NPPluginFuncs* nppfuncs) {
    nppfuncs->version = (NP_VERSION_MAJOR << 8) | NP_VERSION_MINOR;
    nppfuncs->newp = NPP_New;
    nppfuncs->destroy = NPP_Destroy;
    nppfuncs->setwindow = NPP_SetWindow;
    nppfuncs->newstream = NPP_NewStream;
    nppfuncs->destroystream = NPP_DestroyStream;
    nppfuncs->asfile = NPP_StreamAsFile;
    nppfuncs->writeready = NPP_WriteReady;
    nppfuncs->write = NPP_Write;
    nppfuncs->print = NPP_Print;
    nppfuncs->event = NPP_HandleEvent;
    nppfuncs->urlnotify = NPP_URLNotify;
    nppfuncs->getvalue = NPP_GetValue;
    nppfuncs->setvalue = NPP_SetValue;
    return NPERR_NO_ERROR;
  }

#ifndef HIBYTE
#define HIBYTE(x) ((((unsigned short)(x)) & 0xff00) >> 8)
#endif

NPError OSCALL NP_Initialize(NPNetscapeFuncs* npnf
#if !defined(OS_WIN) && !defined(WEBKIT_DARWIN_SDK)
               , NPPluginFuncs *nppfuncs) {
#else
               ) {
#endif
                 PluginFactory::Init();
                 //g_Log.OpenLog("NPAPI");
                 if(npnf == NULL) {
                   return NPERR_INVALID_FUNCTABLE_ERROR;
                 }
                 if(HIBYTE(npnf->version) > NP_VERSION_MAJOR) {
                   return NPERR_INCOMPATIBLE_VERSION_ERROR;
                 }
                 g_NpnFuncs = npnf;
#if !defined(OS_WIN) && !defined(WEBKIT_DARWIN_SDK)
                 NP_GetEntryPoints(nppfuncs);
#endif
                 return NPERR_NO_ERROR;
}

NPError  OSCALL NP_Shutdown() {
  return NPERR_NO_ERROR;
}

char* NP_GetMIMEDescription(void) {
  return const_cast<char*>(kMIMEType);
}

// Needs to be present for WebKit based browsers.
NPError OSCALL NP_GetValue(void* npp, NPPVariable variable, void* value) {
  return NPP_GetValue((NPP)npp, variable, value);
}
#ifdef __cplusplus
}
#endif