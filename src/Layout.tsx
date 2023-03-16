import {
    createStyles,
    Paper,
    Title,
    Text,
    TextInput,
    Button,
    Container,
    Group,
    Anchor,
    Center,
    Box,
    rem,
  } from '@mantine/core';
  
  const useStyles = createStyles((theme) => ({
    title: {
      fontSize: rem(26),
      fontWeight: 900,
      fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    },
  
    controls: {
      [theme.fn.smallerThan('xs')]: {
        flexDirection: 'column-reverse',
      },
    },
  
    control: {
      [theme.fn.smallerThan('xs')]: {
        width: '100%',
        textAlign: 'center',
      },
    },
  }));
  
  export function Layout(props:any) {
    const { classes } = useStyles();
  
    return (
      <Container size={460} my={30}>
        <Title className={classes.title} align="center" c="blue">
          Squash Keeper
        </Title>
        <Text c="dimmed" fz="sm" ta="center">
          feedback to maxawzsinger@gmail.com
        </Text>
  
        <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
          {props.children}
        </Paper>
      </Container>
    );
  }