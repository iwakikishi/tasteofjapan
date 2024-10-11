import React, { useState } from 'react';
import { Text, View, StyleSheet, Button, SafeAreaView, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanTickets } from '@/functions/scan-tickets';

const deviceWidth = Dimensions.get('window').width;

export default function ScanTicketsScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!permission) {
    // Camera permissions are still loading
    return <View className='flex-1 justify-center items-center bg-black' />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View className='flex-1 justify-center items-center bg-gray-900'>
        <Text className='text-white text-lg mb-4'>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title='Grant permission' />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setIsLoading(true);
    setScanned(true);
    setScanResult(`Barcode type: ${type}\nData: ${data}`);

    const checkTicket = async (data: string) => {
      const ticketId = data;
      const result = await scanTickets({ ticketId });
      console.log(result);
      return result;
    };

    const result = await checkTicket(data);
    if (result && typeof result === 'object' && 'status' in result && result.status === 'Success') {
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView className='flex h-full items-center' style={{ backgroundColor: 'black' }}>
      <View className='flex my-4 justify-center items-center'></View>
      <Text className='text-white text-2xl font-bold mb-4'>QR Code Scanner</Text>
      <View className=' bg-gray-800 rounded-lg overflow-hidden border-2' style={{ width: deviceWidth, height: deviceWidth }}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        {scanned && <Button title='Scan Again' onPress={() => setScanned(false)} />}
      </View>
      <Text className='text-white text-lg mt-4 text-center'>{scanned ? scanResult : 'Please scan a QR code'}</Text>
    </SafeAreaView>
  );
}
