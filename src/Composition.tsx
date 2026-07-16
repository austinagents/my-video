import {Composition} from "remotion";
import {MyComp} from "./MyComp";

export const MyComposition: React.FC = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComp}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
