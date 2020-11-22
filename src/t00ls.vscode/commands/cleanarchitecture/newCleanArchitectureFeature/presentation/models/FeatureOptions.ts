import DomainFeatureOptions from "../../domain/entities/FeatureOptions";
import Language from "./Language";

interface FeatureOptions {
  name: string;
  parentDirectory: string;
  language: Language;
}

/**
 * Map the presentation layer feature options to the domain layer feature options.
 * @param featureOptions the presentation layer feature options.
 */
const mapToDomainFeatureOptions = (featureOptions: FeatureOptions): DomainFeatureOptions => {
  return featureOptions;
};

export default FeatureOptions;
export { mapToDomainFeatureOptions };
