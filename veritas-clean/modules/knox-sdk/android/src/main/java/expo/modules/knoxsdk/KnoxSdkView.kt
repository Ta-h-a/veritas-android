package expo.modules.knoxsdk

import android.content.Context
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class KnoxSdkView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  // Knox SDK currently exposes only headless APIs. This placeholder view allows
  // Expo to instantiate the module without rendering UI components.
}
