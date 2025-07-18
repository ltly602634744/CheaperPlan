// components/BetterPlanCard.tsx
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle
} from 'react-native';

interface BetterPlanCard extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  isBlurred?: boolean;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
  activeOpacity?: number;
  lockMessage?: string;
}

const BetterPlanCard: React.FC<BetterPlanCard> = ({ 
  children, 
  isBlurred = false,
  onPress,
  className,
  style,
  activeOpacity = 0.9,
  lockMessage = "🔒 Premium Content",
  ...otherProps
}) => {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      className={className}
      style={style}
      {...otherProps}
    >
      <View style={{ position: 'relative', overflow: 'hidden' }}>
        {children}
        
        {/* 模糊遮罩层 */}
        {isBlurred && (
          <>
            <BlurView
              intensity={50}
              tint={"light"}
              style={[
                StyleSheet.absoluteFillObject,
                { zIndex: 100 }
              ]}
            />
            
            {/* 可选的锁定提示 */}
            <View style={styles.lockContainer}>
              <View style={styles.lockBadge}>
                <Text style={styles.lockText}>{lockMessage}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  lockContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  } as ViewStyle,
  lockBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  lockText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  } as TextStyle
});

export default BetterPlanCard;