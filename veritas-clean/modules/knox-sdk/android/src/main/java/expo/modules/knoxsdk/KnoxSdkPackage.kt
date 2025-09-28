package expo.modules.knoxsdk

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * KnoxSdkPackage provides a lightweight entry point for Expo's autolinking
 * system. It does not expose additional APIs, but allows projects that rely on
 * package discovery to reference a canonical class name.
 */
class KnoxSdkPackage : Module() {
  override fun definition() = ModuleDefinition {
    Name("KnoxSdkPackage")
  }
}
