import { CameraView } from 'expo-camera';
import { View } from 'react-native';

export default function QRScanScreen() {
  return (
    <View className='flex-1'>
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
    </View>
  );
}
