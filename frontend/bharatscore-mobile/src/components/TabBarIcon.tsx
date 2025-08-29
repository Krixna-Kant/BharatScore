import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface TabBarIconProps {
  route: any;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ route, focused, color, size }) => {
  let iconName: string;

  switch (route.name) {
    case 'Dashboard':
      iconName = 'dashboard';
      break;
    case 'Profile':
      iconName = 'person';
      break;
    case 'Apply':
      iconName = 'assignment';
      break;
    case 'SMS':
      iconName = 'sms';
      break;
    default:
      iconName = 'help';
  }

  return <MaterialIcons name={iconName as any} size={size} color={color} />;
};

export default TabBarIcon;
