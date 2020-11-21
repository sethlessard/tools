import DomainFeatureOptions from "../../domain/entities/FeatureOptions";

interface FeatureOptions {
  name: string;
  parentDirectory: string;
  // TODO [TLS-54]: language
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
