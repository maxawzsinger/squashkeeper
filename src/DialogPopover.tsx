import { useDisclosure } from "@mantine/hooks";
import { Modal, Group, Button } from "@mantine/core";

export function DialogPopover(props: any) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Modal opened={opened} onClose={close} title="Authentication" centered>
      {props.children}
    </Modal>
  );
}
