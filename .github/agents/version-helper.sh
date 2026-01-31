#!/bin/bash

# Version Management Helper Script
# This script helps with semantic versioning and git tagging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current version from package.json
get_current_version() {
    grep -oP '(?<="version": ")[^"]*' package.json
}

# Parse version into components
parse_version() {
    local version=$1
    MAJOR=$(echo $version | cut -d. -f1)
    MINOR=$(echo $version | cut -d. -f2)
    PATCH=$(echo $version | cut -d. -f3)
}

# Increment version
increment_version() {
    local current=$1
    local type=$2
    
    parse_version $current
    
    case $type in
        major)
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
            ;;
        minor)
            MINOR=$((MINOR + 1))
            PATCH=0
            ;;
        patch)
            PATCH=$((PATCH + 1))
            ;;
        *)
            echo -e "${RED}Error: Invalid version type. Use 'major', 'minor', or 'patch'${NC}"
            exit 1
            ;;
    esac
    
    echo "${MAJOR}.${MINOR}.${PATCH}"
}

# Update package.json with new version
update_package_json() {
    local new_version=$1
    sed -i "s/\"version\": \".*\"/\"version\": \"${new_version}\"/" package.json
}

# Create and push git tag
create_git_tag() {
    local version=$1
    local message=$2
    
    git tag -a "v${version}" -m "${message}"
    echo -e "${GREEN}Created tag v${version}${NC}"
    echo -e "${YELLOW}Remember to push the tag: git push origin v${version}${NC}"
}

# Main function
main() {
    echo "=== Version Management Helper ==="
    echo ""
    
    current_version=$(get_current_version)
    echo "Current version: ${current_version}"
    echo ""
    
    if [ $# -eq 0 ]; then
        echo "Usage: $0 <major|minor|patch> [commit message]"
        echo ""
        echo "Examples:"
        echo "  $0 patch \"Fix tile animation bug\""
        echo "  $0 minor \"Add multi-tile factorization\""
        echo "  $0 major \"Redesign game architecture\""
        echo ""
        echo "Version types:"
        echo "  major - Breaking changes (X.0.0)"
        echo "  minor - New features (0.X.0)"
        echo "  patch - Bug fixes (0.0.X)"
        exit 0
    fi
    
    version_type=$1
    commit_message=${2:-"Release"}
    
    # Calculate new version
    new_version=$(increment_version $current_version $version_type)
    
    echo "New version will be: ${new_version}"
    echo ""
    
    # Confirm
    read -p "Update version from ${current_version} to ${new_version}? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update package.json
        update_package_json $new_version
        echo -e "${GREEN}✓ Updated package.json${NC}"
        
        # Create tag
        create_git_tag $new_version "${commit_message}"
        
        echo ""
        echo "Next steps:"
        echo "1. Commit the changes: git add package.json && git commit -m 'Bump version to v${new_version}'"
        echo "2. Push the tag: git push origin v${new_version}"
        echo "3. Push the changes: git push"
    else
        echo "Version update cancelled."
    fi
}

main "$@"
