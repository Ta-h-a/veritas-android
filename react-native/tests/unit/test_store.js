import useStore from '../../app/services/store';

describe('Store', () => {
  it('should set current device', () => {
    const { setCurrentDevice, currentDevice } = useStore.getState();
    setCurrentDevice({ id: '1' });
    expect(useStore.getState().currentDevice.id).toBe('1');
  });
});