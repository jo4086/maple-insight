type EquipmentContainerProps = {
  children: React.ReactNode;
};

export const EquipmentContainer = ({ children }: EquipmentContainerProps) => {
  return <section className="w-fit rounded-lg border bg-white/5 p-1">{children}</section>;
};
