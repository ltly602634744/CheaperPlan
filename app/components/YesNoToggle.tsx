import Entypo from '@expo/vector-icons/Entypo';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface YesNoToggleProps {
  field: string;
  label: string;
  value: boolean;
  onValueChange: (field: string, value: boolean) => void;
  showInfoButton?: boolean;
  onInfoPress?: () => void;
}

export const YesNoToggle: React.FC<YesNoToggleProps> = ({
  field,
  label,
  value,
  onValueChange,
  showInfoButton = false,
  onInfoPress,
}) => {
  return (
    <View style={{ marginBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginRight: 8 }}>{label}</Text>
        {showInfoButton && (
          <TouchableOpacity
            onPress={onInfoPress}
            style={{ marginLeft: 4, padding: 4, margin: -4 }} // Negative margin for larger touch area
          >
            <Entypo name="help-with-circle" size={12} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onValueChange(field, !value)}
        activeOpacity={0.7}
        style={{ 
          position: 'relative', 
          backgroundColor: Colors.neutral.light, 
          borderRadius: 20, 
          padding: 4, 
          flexDirection: 'row', 
          height: 40, 
          width: 80 
        }}
      >
        {/* Sliding background */}
        <View
          style={[
            {
              position: 'absolute',
              top: 4,
              bottom: 4,
              width: '50%',
              backgroundColor: Colors.primary.main,
              borderRadius: 16,
              shadowColor: Colors.neutral.darkest,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            },
            value ? { right: 4 } : { left: 4 }
          ]}
        />
        
        {/* No label */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <Text
            style={[
              { fontSize: 14, fontWeight: '600' },
              !value ? { color: Colors.text.inverse } : { color: Colors.text.secondary }
            ]}
          >
            No
          </Text>
        </View>
        
        {/* Yes label */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <Text
            style={[
              { fontSize: 14, fontWeight: '600' },
              value ? { color: Colors.text.inverse } : { color: Colors.text.secondary }
            ]}
          >
            Yes
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};