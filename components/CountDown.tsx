import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, AppState, ViewStyle, TextStyle, AppStateStatus } from 'react-native';
import { sprintf } from 'sprintf-js';

const DEFAULT_DIGIT_STYLE: ViewStyle = { backgroundColor: '#FAB913' };
const DEFAULT_DIGIT_TXT_STYLE: TextStyle = { color: '#000' };
const DEFAULT_TIME_LABEL_STYLE: TextStyle = { color: '#000' };
const DEFAULT_SEPARATOR_STYLE: TextStyle = { color: '#000' };
const DEFAULT_TIME_TO_SHOW: Array<'D' | 'H' | 'M' | 'S'> = ['D', 'H', 'M', 'S'];
const DEFAULT_TIME_LABELS: { [key: string]: string } = {
  d: 'Days',
  h: 'Hours',
  m: 'Minutes',
  s: 'Seconds',
};

interface CountDownProps {
  id?: string;
  digitStyle?: ViewStyle;
  digitTxtStyle?: TextStyle;
  timeLabelStyle?: TextStyle;
  separatorStyle?: TextStyle;
  timeToShow?: Array<'D' | 'H' | 'M' | 'S'>;
  showSeparator?: boolean;
  size?: number;
  until: number;
  onChange?: (time: number) => void;
  onPress?: () => void;
  onFinish?: () => void;
  running?: boolean;
  style?: ViewStyle;
  timeLabels?: { [key: string]: string };
}

const CountDown: React.FC<CountDownProps> = ({
  id,
  digitStyle = DEFAULT_DIGIT_STYLE,
  digitTxtStyle = DEFAULT_DIGIT_TXT_STYLE,
  timeLabelStyle = DEFAULT_TIME_LABEL_STYLE,
  separatorStyle = DEFAULT_SEPARATOR_STYLE,
  timeToShow = DEFAULT_TIME_TO_SHOW,
  showSeparator = false,
  size = 15,
  until: untilProp = 0,
  onChange,
  onPress,
  onFinish,
  running = true,
  style,
  timeLabels = DEFAULT_TIME_LABELS,
}) => {
  const [until, setUntil] = useState(Math.max(untilProp, 0));
  const [wentBackgroundAt, setWentBackgroundAt] = useState<number | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const timerInterval = setInterval(updateTimer, 1000);
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(timerInterval);
      subscription.remove();
    };
  }, [running]);

  useEffect(() => {
    setUntil(Math.max(untilProp, 0));
  }, [untilProp, id]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      setWentBackgroundAt(Date.now());
    }
    if (appState.current.match(/inactive|background/) && nextAppState === 'active' && wentBackgroundAt && running) {
      const diff = (Date.now() - wentBackgroundAt) / 1000.0;
      setUntil(Math.max(0, until - diff));
    }
    appState.current = nextAppState;
  };

  const updateTimer = () => {
    if (!running) return;

    setUntil((prevUntil) => {
      const newUntil = Math.max(0, prevUntil - 1);

      if (newUntil === 1 || (newUntil === 0 && untilProp !== 1)) {
        if (onFinish) onFinish();
      }

      if (onChange) onChange(newUntil);

      return newUntil;
    });
  };

  const getTimeLeft = () => {
    return {
      seconds: until % 60,
      minutes: parseInt((until / 60).toString(), 10) % 60,
      hours: parseInt((until / (60 * 60)).toString(), 10) % 24,
      days: parseInt((until / (60 * 60 * 24)).toString(), 10),
    };
  };

  const renderDigit = (d: string) => (
    <View style={[styles.digitCont, { width: size * 2.3, height: size * 2.6 }, digitStyle]}>
      <Text style={[styles.digitTxt, { fontSize: size }, digitTxtStyle]}>{d}</Text>
    </View>
  );

  const renderLabel = (label: string) => {
    if (label) {
      return <Text style={[styles.timeTxt, { fontSize: size / 1.8 }, timeLabelStyle]}>{label}</Text>;
    }
  };

  const renderDoubleDigits = (label: string, digits: string) => (
    <View style={styles.doubleDigitCont}>
      <View style={styles.timeInnerCont}>{renderDigit(digits)}</View>
      {renderLabel(label)}
    </View>
  );

  const renderSeparator = () => (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[styles.separatorTxt, { fontSize: size * 1.2 }, separatorStyle]}>:</Text>
    </View>
  );

  const renderCountDown = () => {
    const { days, hours, minutes, seconds } = getTimeLeft();
    const newTime = sprintf('%02d:%02d:%02d:%02d', days, hours, minutes, seconds).split(':');
    const Component = onPress ? TouchableOpacity : View;

    return (
      <Component style={styles.timeCont} onPress={onPress}>
        {timeToShow.includes('D') ? renderDoubleDigits(timeLabels.d, newTime[0]) : null}
        {showSeparator && timeToShow.includes('D') && timeToShow.includes('H') ? renderSeparator() : null}
        {timeToShow.includes('H') ? renderDoubleDigits(timeLabels.h, newTime[1]) : null}
        {showSeparator && timeToShow.includes('H') && timeToShow.includes('M') ? renderSeparator() : null}
        {timeToShow.includes('M') ? renderDoubleDigits(timeLabels.m, newTime[2]) : null}
        {showSeparator && timeToShow.includes('M') && timeToShow.includes('S') ? renderSeparator() : null}
        {timeToShow.includes('S') ? renderDoubleDigits(timeLabels.s, newTime[3]) : null}
      </Component>
    );
  };

  return <View style={style}>{renderCountDown()}</View>;
};

const styles = StyleSheet.create({
  timeCont: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timeTxt: {
    color: 'white',
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  timeInnerCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitCont: {
    borderRadius: 5,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doubleDigitCont: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitTxt: {
    color: 'white',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  separatorTxt: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
  },
});

export default CountDown;
