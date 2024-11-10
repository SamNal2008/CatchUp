import { ThemedText } from '../atoms/ThemedText';
import { render, screen } from '@testing-library/react-native';

describe('ThemedText', () => {
  it(`renders correctly`, () => {
    render(<ThemedText>Snapshot test!</ThemedText>);
    expect(screen.getByText('Snapshot test!')).toBeDefined();
  });
});
